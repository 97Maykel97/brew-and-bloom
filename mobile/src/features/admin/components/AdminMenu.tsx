import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';

type TMenuProduct = { id: string; product_key: string; name: string; price: number; stock_quantity: number; is_active: boolean };

const COPY = {
	ru: { active: 'В продаже', add: 'Добавить товар', addTitle: 'Новая позиция', cancel: 'Отмена', empty: 'В меню пока нет товаров', error: 'Не удалось обновить меню.', name: 'Название товара', out: 'Нет в наличии', price: 'Цена, ₪', save: 'Сохранить цену', search: 'Поиск товара', stock: 'В наличии', subtitle: 'Добавляйте позиции и контролируйте остатки', title: 'Управление меню' },
	en: { active: 'On sale', add: 'Add product', addTitle: 'New item', cancel: 'Cancel', empty: 'There are no menu items yet', error: 'Could not update the menu.', name: 'Product name', out: 'Out of stock', price: 'Price, ₪', save: 'Save price', search: 'Search products', stock: 'In stock', subtitle: 'Add products and control inventory', title: 'Menu management' },
	he: { active: 'במכירה', add: 'הוספת מוצר', addTitle: 'פריט חדש', cancel: 'ביטול', empty: 'אין עדיין פריטים בתפריט', error: 'לא ניתן לעדכן את התפריט.', name: 'שם המוצר', out: 'אזל מהמלאי', price: 'מחיר, ₪', save: 'שמירת מחיר', search: 'חיפוש מוצר', stock: 'במלאי', subtitle: 'הוספת מוצרים וניהול מלאי', title: 'ניהול תפריט' },
} as const;

export default function AdminMenu({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const copy = COPY[locale];
	const [products, setProducts] = useState<TMenuProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [name, setName] = useState('');
	const [price, setPrice] = useState('');
	const [stock, setStock] = useState('0');
	const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
	const [error, setError] = useState('');
	const visibleProducts = products.filter(product => product.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

	useEffect(() => {
		let isActive = true;
		async function loadProducts() {
			const { data, error: loadError } = await supabase.from('menu_products').select('id, product_key, name, price, stock_quantity, is_active').order('created_at');
			if (!isActive) return;
			if (loadError) setError(copy.error);
			else setProducts((data as TMenuProduct[] | null) ?? []);
			setIsLoading(false);
		}
		void loadProducts();
		const channel = supabase.channel(`admin-menu-products-${Date.now()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'menu_products' }, payload => {
			const changedProduct = payload.new as TMenuProduct;
			if (!changedProduct?.id) return;
			setProducts(current => mergeMenuProduct(current, changedProduct));
		}).subscribe();
		return () => { isActive = false; void supabase.removeChannel(channel); };
	}, [copy.error]);

	async function addProduct() {
		const normalizedName = name.trim();
		const normalizedPrice = Number(price);
		const normalizedStock = Number(stock);
		if (!normalizedName || !Number.isInteger(normalizedPrice) || normalizedPrice < 0 || !Number.isInteger(normalizedStock) || normalizedStock < 0 || isSaving) return;

		setIsSaving(true);
		setError('');
		const productKey = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
		const { data, error: insertError } = await supabase.from('menu_products').insert({ product_key: productKey, name: normalizedName, price: normalizedPrice, stock_quantity: normalizedStock }).select('id, product_key, name, price, stock_quantity, is_active').single();
		if (insertError) setError(copy.error);
		else {
			setProducts(current => mergeMenuProduct(current, data as TMenuProduct));
			setName(''); setPrice(''); setStock('0'); setIsFormOpen(false);
		}
		setIsSaving(false);
	}

	async function updateProduct(product: TMenuProduct, values: Partial<Pick<TMenuProduct, 'is_active' | 'price' | 'stock_quantity'>>) {
		if (pendingId) return false;
		setPendingId(product.id);
		setError('');
		const { data, error: updateError } = await supabase.from('menu_products').update(values).eq('id', product.id).select('id, product_key, name, price, stock_quantity, is_active').single();
		if (updateError) setError(copy.error);
		else setProducts(current => mergeMenuProduct(current, data as TMenuProduct));
		setPendingId(null);
		return !updateError;
	}

	async function savePrice(product: TMenuProduct) {
		const nextPrice = Number(priceDrafts[product.id] ?? product.price);
		if (!Number.isInteger(nextPrice) || nextPrice < 0 || nextPrice === product.price) return;
		if (await updateProduct(product, { price: nextPrice })) setPriceDrafts(current => { const next = { ...current }; delete next[product.id]; return next; });
	}

	if (isLoading) return <View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>;

	return <View style={styles.section}>
		<View style={styles.hero}>
			<View style={[styles.heroHeading, isRtl && styles.rtlRow]}><View style={styles.heroIcon}><Feather name='coffee' size={20} color={Colors.white} /></View><View style={styles.heroCopy}><Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text><Text style={[styles.subtitle, isRtl && styles.rtlText]}>{copy.subtitle}</Text></View></View>
			<Pressable onPress={() => setIsFormOpen(current => !current)} style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}><Feather name={isFormOpen ? 'x' : 'plus'} size={17} color={Colors.white} /><Text style={styles.addButtonText}>{isFormOpen ? copy.cancel : copy.add}</Text></Pressable>
			{isFormOpen ? <View style={styles.form}><Text style={[styles.formTitle, isRtl && styles.rtlText]}>{copy.addTitle}</Text><Field isRtl={isRtl} label={copy.name} onChangeText={setName} value={name} /><View style={[styles.formRow, isRtl && styles.rtlRow]}><View style={styles.formHalf}><Field isRtl={isRtl} keyboardType='number-pad' label={copy.price} onChangeText={setPrice} value={price} /></View><View style={styles.formHalf}><Field isRtl={isRtl} keyboardType='number-pad' label={copy.stock} onChangeText={setStock} value={stock} /></View></View><Pressable disabled={isSaving} onPress={() => void addProduct()} style={({ pressed }) => [styles.saveButton, (pressed || isSaving) && styles.pressed]}>{isSaving ? <ActivityIndicator color={Colors.white} size='small' /> : <Feather name='check' size={16} color={Colors.white} />}<Text style={styles.saveButtonText}>{copy.add}</Text></Pressable></View> : null}
		</View>

		<View style={[styles.searchBox, isRtl && styles.rtlRow]}><Feather name='search' size={18} color={Colors.muted} /><TextInput autoCorrect={false} onChangeText={setQuery} placeholder={copy.search} placeholderTextColor={Colors.muted} style={[styles.searchInput, isRtl && styles.rtlText]} value={query} />{query ? <Pressable hitSlop={8} onPress={() => setQuery('')}><Feather name='x' size={17} color={Colors.muted} /></Pressable> : null}</View>
		{error ? <Text style={[styles.error, isRtl && styles.rtlText]}>{error}</Text> : null}
		{visibleProducts.length === 0 ? <View style={styles.empty}><Feather name='coffee' size={28} color={Colors.muted} /><Text style={[styles.emptyText, isRtl && styles.rtlText]}>{copy.empty}</Text></View> : <View style={styles.list}>{visibleProducts.map(product => {
			const isOut = product.stock_quantity === 0;
			return <View style={[styles.card, (!product.is_active || isOut) && styles.inactiveCard]} key={product.id}>
				<View style={[styles.cardHeader, isRtl && styles.rtlRow]}><View style={styles.cardCopy}><Text numberOfLines={1} style={[styles.productName, isRtl && styles.rtlText]}>{product.name}</Text><View style={[styles.priceEditor, isRtl && styles.rtlRow]}><TextInput accessibilityLabel={copy.price} keyboardType='number-pad' maxLength={7} onChangeText={value => setPriceDrafts(current => ({ ...current, [product.id]: value }))} style={styles.priceInput} value={priceDrafts[product.id] ?? String(product.price)} /><Text style={styles.currency}>₪</Text><Pressable accessibilityLabel={copy.save} disabled={pendingId === product.id || Number(priceDrafts[product.id] ?? product.price) === product.price} onPress={() => void savePrice(product)} style={({ pressed }) => [styles.priceSave, (pressed || Number(priceDrafts[product.id] ?? product.price) === product.price) && styles.disabled]}><Feather name='check' size={15} color={Colors.white} /></Pressable></View></View><Pressable disabled={pendingId === product.id} onPress={() => void updateProduct(product, { is_active: !product.is_active })} style={({ pressed }) => [styles.powerButton, product.is_active && styles.powerButtonActive, pressed && styles.pressed]}><Feather name='power' size={16} color={product.is_active ? '#526C48' : Colors.muted} /></Pressable></View>
				<View style={[styles.stockPanel, isRtl && styles.rtlRow]}><View><Text style={[styles.stockLabel, isRtl && styles.rtlText]}>{copy.stock}</Text><Text style={[styles.stockState, isOut && styles.outText, isRtl && styles.rtlText]}>{isOut ? copy.out : copy.active}</Text></View><View style={[styles.stepper, isRtl && styles.rtlRow]}><Pressable disabled={pendingId === product.id || isOut} onPress={() => void updateProduct(product, { stock_quantity: Math.max(0, product.stock_quantity - 1) })} style={({ pressed }) => [styles.stepButton, (pressed || isOut) && styles.disabled]}><Feather name='minus' size={15} color={Colors.foreground} /></Pressable><TextInput accessibilityLabel={copy.stock} defaultValue={String(product.stock_quantity)} editable={pendingId !== product.id} inputMode='numeric' key={product.stock_quantity} keyboardType='number-pad' onEndEditing={event => { const value = Number.parseInt(event.nativeEvent.text, 10); const nextStock = Number.isFinite(value) ? Math.max(0, value) : product.stock_quantity; if (nextStock !== product.stock_quantity) void updateProduct(product, { stock_quantity: nextStock }); }} selectTextOnFocus style={styles.stockInput} /><Pressable disabled={pendingId === product.id} onPress={() => void updateProduct(product, { stock_quantity: product.stock_quantity + 1 })} style={({ pressed }) => [styles.stepButton, styles.stepButtonPrimary, pressed && styles.pressed]}><Feather name='plus' size={15} color={Colors.white} /></Pressable></View></View>
			</View>;
		})}</View>}
	</View>;
}

function mergeMenuProduct(products: TMenuProduct[], changedProduct: TMenuProduct) {
	const exists = products.some(product => product.id === changedProduct.id);
	if (!exists) return [...products, changedProduct];
	return products.map(product => product.id === changedProduct.id ? changedProduct : product);
}

function Field({ isRtl, keyboardType, label, onChangeText, value }: { isRtl: boolean; keyboardType?: 'default' | 'number-pad'; label: string; onChangeText: (value: string) => void; value: string }) {
	return <View style={styles.field}><Text style={[styles.fieldLabel, isRtl && styles.rtlText]}>{label}</Text><TextInput keyboardType={keyboardType} maxLength={keyboardType === 'number-pad' ? 7 : 120} onChangeText={onChangeText} style={[styles.input, isRtl && styles.rtlText]} value={value} /></View>;
}

const styles = StyleSheet.create({
	section: { gap: Spacing.medium }, loading: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
	hero: { padding: 16, gap: 14, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.78)' },
	heroHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 }, heroIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accent }, heroCopy: { minWidth: 0, flex: 1 },
	title: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 19, fontWeight: '800' }, subtitle: { marginTop: 3, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11, lineHeight: 16 },
	addButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 22, backgroundColor: Colors.accent }, addButtonText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '800' },
	form: { padding: 13, gap: 11, borderRadius: 15, backgroundColor: '#F2E7DB' }, formTitle: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '800' }, formRow: { flexDirection: 'row', gap: 9 }, formHalf: { minWidth: 0, flex: 1 }, field: { gap: 5 }, fieldLabel: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 10, fontWeight: '600' }, input: { height: 43, paddingHorizontal: 12, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, borderWidth: 1, borderColor: '#D8CABD', borderRadius: 11, backgroundColor: Colors.white }, saveButton: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12, backgroundColor: '#63805A' }, saveButtonText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '800' },
	searchBox: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.82)' }, searchInput: { minWidth: 0, flex: 1, paddingVertical: 10, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13 },
	error: { padding: 12, color: '#B33A3A', fontFamily: Fonts.sans, fontSize: 12, borderRadius: 12, backgroundColor: '#FFF0EF' }, empty: { minHeight: 230, alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 1, borderColor: '#E4D8CD', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.75)' }, emptyText: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700' },
	list: { gap: 11 }, card: { padding: 14, gap: 13, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.82)' }, inactiveCard: { backgroundColor: 'rgba(241,238,235,0.85)' }, cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }, cardCopy: { minWidth: 0, flex: 1 }, productName: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '800' }, priceEditor: { marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 7 }, priceInput: { width: 96, height: 38, paddingHorizontal: 11, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '800', textAlign: 'left', borderWidth: 1, borderColor: '#D8CABD', borderRadius: 10, backgroundColor: Colors.white }, currency: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '800' }, priceSave: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#63805A' }, powerButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: '#ECE8E4' }, powerButtonActive: { backgroundColor: '#E7F0E2' },
	stockPanel: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 13, backgroundColor: '#F5EDE4' }, stockLabel: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }, stockState: { marginTop: 3, color: '#526C48', fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' }, outText: { color: '#B33A3A' }, stepper: { flexDirection: 'row', alignItems: 'center', gap: 7 }, stepButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D8CABD', borderRadius: 18, backgroundColor: Colors.white }, stepButtonPrimary: { borderColor: Colors.accent, backgroundColor: Colors.accent }, stockInput: { width: 52, height: 36, padding: 0, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '800', textAlign: 'center', borderWidth: 1, borderColor: '#D8CABD', borderRadius: 10, backgroundColor: Colors.white },
	rtlRow: { flexDirection: 'row-reverse' }, rtlText: { textAlign: 'right', writingDirection: 'rtl' }, pressed: { opacity: 0.65 }, disabled: { opacity: 0.35 },
});
