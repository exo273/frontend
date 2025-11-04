<script>
	export let columns = []; // Array de { key, label, width, align }
	export let data = []; // Array de objetos con los datos
	export let actions = []; // Array de { label, icon, class, onClick }
	export let onRowClick = null;
	export let loading = false;
	export let emptyMessage = 'No hay datos para mostrar';
</script>

<div class="table-container">
	{#if loading}
		<div class="flex justify-center items-center p-8">
			<span class="text-4xl animate-spin">⏳</span>
			<span class="ml-4">Cargando...</span>
		</div>
	{:else if data.length === 0}
		<div class="text-center p-8 text-surface-600-300-token">
			<p class="text-lg">📭</p>
			<p>{emptyMessage}</p>
		</div>
	{:else}
		<table class="table table-hover">
			<thead>
				<tr>
					{#each columns as column}
						<th
							class="{column.width || ''} {column.align ? 'text-' + column.align : ''}"
						>
							{column.label}
						</th>
					{/each}
					{#if actions.length > 0}
						<th class="text-right">Acciones</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each data as row, index}
					<tr
						class:cursor-pointer={onRowClick}
						on:click={() => onRowClick && onRowClick(row)}
					>
						{#each columns as column}
							<td class="{column.align ? 'text-' + column.align : ''}">
								{#if column.component}
									<svelte:component this={column.component} {row} />
								{:else if column.format}
									{column.format(row[column.key], row)}
								{:else}
									{row[column.key] || '-'}
								{/if}
							</td>
						{/each}
						{#if actions.length > 0}
							<td class="text-right">
								<div class="flex justify-end gap-2">
									{#each actions as action}
										<button
											class="btn btn-sm {action.class || 'variant-ghost-surface'}"
											on:click|stopPropagation={() => action.onClick(row)}
											title={action.label}
										>
											{#if action.icon}
												<span>{action.icon}</span>
											{/if}
											{#if action.showLabel !== false}
												<span class="hidden sm:inline">{action.label}</span>
											{/if}
										</button>
									{/each}
								</div>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
