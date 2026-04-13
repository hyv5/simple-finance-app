import React, { useCallback, useState, useMemo } from 'react';
import { View, StyleSheet, RefreshControl, ScrollView, ActivityIndicator, Text, TouchableOpacity, TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuotes, useFundManager } from '@/src/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Quote } from '@/src/domain/entities';
import { searchSymbols } from '@/src/api/search';
import { getSymbolCategory, getCategoryName, groupByCategory, SymbolCategory } from '@/src/utils/symbolCategory';
import { useRouter } from 'expo-router';

// 可折叠的类别区域
interface CollapsibleSectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  count, 
  isExpanded, 
  onToggle, 
  children 
}) => {
  const backgroundColor = useThemeColor({ light: '#f5f5f5', dark: '#2c2c2c' }, 'background');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={styles.section}>
      <TouchableOpacity 
        style={[styles.sectionHeader, { backgroundColor }]} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.arrow, { color: textColor }]}>
            {isExpanded ? '▼' : '▶'}
          </Text>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

// 表格头部
const TableHeader: React.FC = () => {
  const headerBgColor = useThemeColor({ light: '#e8e8e8', dark: '#3a3a3a' }, 'background');
  
  return (
    <View style={[styles.tableHeader, { backgroundColor: headerBgColor }]}>
      <Text style={[styles.headerCell, styles.nameCell]}>名称</Text>
      <Text style={[styles.headerCell, styles.priceCell]}>最新价</Text>
      <Text style={[styles.headerCell, styles.changeCell]}>涨跌幅</Text>
    </View>
  );
};

// 表格行
interface TableRowProps {
  quote: Quote;
  onPress: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ quote, onPress }) => {
  const textColor = useThemeColor({}, 'text');
  const isPositive = quote.change > 0;
  const isNegative = quote.change < 0;
  const changeColor = isPositive ? '#ff4d4f' : isNegative ? '#52c41a' : textColor;
  
  // 根据涨跌设置整行背景色
  let rowBackgroundColor = 'transparent';
  if (isPositive) {
    rowBackgroundColor = 'rgba(255, 77, 79, 0.08)';  // 浅红色背景
  } else if (isNegative) {
    rowBackgroundColor = 'rgba(82, 196, 26, 0.08)';  // 浅绿色背景
  }
  
  return (
    <TouchableOpacity 
      style={[styles.tableRow, { backgroundColor: rowBackgroundColor }]} 
      onPress={onPress} 
      activeOpacity={0.6}
    >
      <View style={styles.nameCell}>
        <Text style={[styles.nameText, { color: textColor }]} numberOfLines={1}>
          {quote.name}
        </Text>
        <Text style={styles.symbolText}>{quote.symbol}</Text>
      </View>
      
      <View style={styles.priceCell}>
        <Text style={[styles.priceText, { color: changeColor }]}>
          {quote.price.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.changeCell}>
        <Text style={[styles.changeText, { color: changeColor }]}>
          {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
        </Text>
        <Text style={[styles.changeSubText, { color: changeColor }]}>
          {isPositive ? '+' : ''}{quote.change.toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * 自选页面 - 可折叠表格形式
 */
export default function WatchlistScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // 折叠状态管理
  const [expandedSections, setExpandedSections] = useState<Record<SymbolCategory, boolean>>({
    futures: true,
    fund: true,
    stock: true,
    bond: true,
    forex: true,
    unknown: true,
  });

  const { funds, addFund } = useFundManager();
  const textColor = useThemeColor({}, 'text');
  
  // 批量获取所有自选数据
  const { data: quotes, isLoading } = useQuotes(funds);

  // 按类别分组
  const groupedQuotes = useMemo(() => {
    if (!quotes) return {} as Record<SymbolCategory, Quote[]>;
    return groupByCategory(quotes);
  }, [quotes]);

  // 切换折叠状态
  const toggleSection = useCallback((category: SymbolCategory) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchSymbols(searchKey);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ queryKey: ['quotes'] });
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const handleAddSymbol = async (symbol: string) => {
    const success = await addFund(symbol);
    if (success) {
      setShowSearch(false);
      setSearchKey('');
      setSearchResults([]);
    }
  };

  const handleRowPress = (symbol: string) => {
    router.push(`/details/${symbol}`);
  };

  const categories: SymbolCategory[] = ['futures', 'fund', 'stock', 'bond', 'forex', 'unknown'];

  if (isLoading && !quotes) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={["#007AFF"]}
          />
        }
      >
        {/* 标题栏 */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">自选</ThemedText>
          <Text 
            style={[styles.searchButton, { color: textColor }]} 
            onPress={() => setShowSearch(true)}
          >
            + 添加
          </Text>
        </ThemedView>

        {/* 表格头部 */}
        <TableHeader />

        {/* 分组折叠列表 */}
        {funds.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>暂无自选品种</ThemedText>
            <ThemedText style={styles.emptySubText}>点击右上角添加</ThemedText>
          </View>
        ) : (
          categories.map((category) => {
            const categoryQuotes = groupedQuotes[category] || [];
            if (categoryQuotes.length === 0) return null;
            
            return (
              <CollapsibleSection
                key={category}
                title={getCategoryName(category)}
                count={categoryQuotes.length}
                isExpanded={expandedSections[category]}
                onToggle={() => toggleSection(category)}
              >
                {categoryQuotes.map((quote) => (
                  <TableRow 
                    key={quote.symbol} 
                    quote={quote}
                    onPress={() => handleRowPress(quote.symbol)}
                  />
                ))}
              </CollapsibleSection>
            );
          })
        )}
      </ScrollView>

      {/* 搜索弹窗 */}
      {showSearch && (
        <View style={styles.searchOverlay}>
          <View style={styles.searchHeader}>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索基金/股票/期货代码或名称"
              value={searchKey}
              onChangeText={setSearchKey}
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <Text style={styles.cancelButton} onPress={() => setShowSearch(false)}>
              取消
            </Text>
          </View>

          {isSearching ? (
            <ActivityIndicator style={styles.searchLoading} />
          ) : (
            <ScrollView>
              {searchResults.map((item) => {
                const category = getSymbolCategory(item.symbol);
                return (
                  <View key={item.symbol} style={styles.searchItem}>
                    <View style={styles.itemInfo}>
                      <View style={styles.itemNameRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <View style={styles.typeTag}>
                          <Text style={styles.typeTagText}>{getCategoryName(category)}</Text>
                        </View>
                      </View>
                      <Text style={styles.itemSymbol}>{item.symbol}</Text>
                    </View>
                    <Text style={styles.addButton} onPress={() => handleAddSymbol(item.symbol)}>
                      添加
                    </Text>
                  </View>
                );
              })}
              {searchResults.length === 0 && searchKey.length > 0 && !isSearching && (
                <View style={styles.noResultContainer}>
                  <Text style={styles.noResultText}>未找到相关品种</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 表格样式
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.7,
  },
  nameCell: {
    flex: 2,
  },
  priceCell: {
    flex: 1,
    textAlign: 'center',
  },
  changeCell: {
    flex: 1,
    textAlign: 'right',
  },
  
  // 折叠区域样式
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginRight: 8,
    width: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionContent: {
    paddingHorizontal: 8,
  },
  
  // 表格行样式
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '500',
  },
  symbolText: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 2,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  changeSubText: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'right',
    marginTop: 2,
  },
  
  // 空状态
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
  },
  emptySubText: {
    fontSize: 14,
    opacity: 0.3,
    marginTop: 8,
  },
  
  // 搜索样式
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    paddingTop: 60,
  },
  searchHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  cancelButton: {
    marginLeft: 12,
    fontSize: 16,
    color: '#007AFF',
    lineHeight: 40,
  },
  searchLoading: {
    marginTop: 20,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  itemInfo: {
    flex: 1,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  typeTag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  typeTagText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  itemSymbol: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  addButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  noResultContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  noResultText: {
    fontSize: 14,
    opacity: 0.5,
  },
});
